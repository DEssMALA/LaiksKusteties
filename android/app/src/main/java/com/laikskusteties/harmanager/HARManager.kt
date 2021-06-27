package com.laikskusteties.harmanager

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.util.Log
import android.view.View
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager
import com.laikskusteties.ml.Squats152
import io.invertase.firebase.app.ReactNativeFirebaseApp.getApplicationContext
import org.tensorflow.lite.DataType
import org.tensorflow.lite.support.label.TensorLabel
import org.tensorflow.lite.support.tensorbuffer.TensorBuffer
import java.nio.ByteBuffer
import java.util.*
import kotlin.concurrent.timer


// XXX: On some devices sensors stop reporting events after phone screen is locked. And there are no
// good solutions for that. This behaviour is implemented by phone manufacturers and can
// even change with OS updates. Therefore some workaround must be implemented, like keeping screen
// on and asking users not to lock it. More info:
// https://stackoverflow.com/questions/9982433/android-accelerometer-not-working-when-screen-is-turned-off

class HARManager(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), SensorEventListener {

    private val WINDOWSIZE = 80
    private var ctx = reactContext
    private var sensorManager: SensorManager =
        getApplicationContext().getSystemService(Context.SENSOR_SERVICE) as SensorManager
//    private var sensorManager: SensorManager = reactContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager

    private var accelSensor: Sensor? = null
    private var gyroSensor: Sensor? = null
    private var running: Boolean = false

    private var data = FloatArray(WINDOWSIZE * 6) { _ -> 0F }
    private var aNum: Int = 0
    private var gNum: Int = 0

    private var model: Squats152? = null

    private var mainHandler = Handler(Looper.getMainLooper())
//
//    private var wakeLock: PowerManager.WakeLock = (getApplicationContext().getSystemService(Context.POWER_SERVICE) as PowerManager).run {
//        newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "MyApp::MyWakelockTag")
//    }

    init {
        var accelList = sensorManager.getSensorList(Sensor.TYPE_LINEAR_ACCELERATION)
        var gyroList = sensorManager.getSensorList(Sensor.TYPE_GYROSCOPE)
        accelList?.let {
            if (it.isNotEmpty())
                accelSensor = sensorManager.getDefaultSensor(Sensor.TYPE_LINEAR_ACCELERATION, true)
        }
        gyroList?.let {
            if (it.isNotEmpty())
                gyroSensor = sensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE, true)
        }

//        Log.d("HARManager", "$wakeLock")

    }

    override fun getName(): String {
        return "KotlinHARManager"
    }

    @ReactMethod
    fun test(cb: Callback) {
        cb.invoke()
    }

    private fun getModel(type: Int): Squats152 {
        return when (type) {
            1 -> Squats152.newInstance(ctx);
            else -> Squats152.newInstance(ctx);
        }
    }

//    fun onTimer() {
//        Log.d("HARManager", "onTimer $wakeLock")
//    }

    @ReactMethod
    fun start(type: Int, cb: Callback) {
        Log.d("HARManager", "start received")
        if (running) privateStop()
        if (accelSensor != null)
            sensorManager.registerListener(this, accelSensor, 1000000 / 20)
        if (gyroSensor != null)
            sensorManager.registerListener(this, gyroSensor, 1000000 / 20)
        model = getModel(type)
//        wakeLock.acquire(100000000)

//        mainHandler.post(object : Runnable {
//            override fun run() {
//                Log.d("HARManager", "onTimer $wakeLock")
//                mainHandler.postDelayed(this, 1000)
//            }
//        })

        running = true
        cb.invoke()
    }

    private fun privateStop() {
        if (!running) return
        sensorManager.unregisterListener(this)
//        wakeLock.release()
        model?.close()
        aNum = 0
        gNum = 0
        data.resetArray(0)
        running = false
    }

    @ReactMethod
    fun stop(cb: Callback) {
        Log.d("HARManager", "stop received")
        privateStop()
        cb.invoke()
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        return
    }

    override fun onSensorChanged(event: SensorEvent?) {
//        Log.d("HARManager", "Sensor Event received $event $gNum $aNum")
        if (event?.sensor == null) return
        if (event?.sensor?.type == Sensor.TYPE_GYROSCOPE) {
            if (gNum > aNum) return
            data[gNum * 6 + 3] = event.values[0]
            data[gNum * 6 + 4] = event.values[1]
            data[gNum * 6 + 5] = event.values[2]
            gNum += 1
        } else if (event?.sensor?.type == Sensor.TYPE_LINEAR_ACCELERATION) {
            if (gNum < aNum) return
            data[aNum * 6 + 0] = event.values[0]
            data[aNum * 6 + 1] = event.values[1]
            data[aNum * 6 + 2] = event.values[2]
            aNum += 1
        }
        if (gNum == aNum && gNum >= WINDOWSIZE) {
            Log.d("HARManager", "onSensorChanged should call recognise $gNum")
            recognise()
            gNum = 0
            aNum = 0
        }
    }

    private fun notifyRN(data: MutableMap<String, Float>) {
        var params: WritableMap = Arguments.createMap()
        Log.d("HARManager", "notifyRN: $data")
        data["0"]?.let { params.putDouble("0", it.toDouble()) }
        data["1"]?.let { params.putDouble("1", it.toDouble()) }
        data["2"]?.let { params.putDouble("2", it.toDouble()) }
        data["3"]?.let { params.putDouble("3", it.toDouble()) }
        ctx.getJSModule(RCTDeviceEventEmitter::class.java)
            .emit("ClassifiedHAR", params);
    }

    private fun toString(bb: ByteBuffer): String? {
        val sb = StringBuilder()
        val ba = bb.array()
        Log.d("HARManager", "toString: ${ba.size} ${bb.limit()}")
        ba.forEach { b -> sb.append("${b.toUByte()}, ") }
        return sb.toString()
    }

    private fun recognise() {
        Log.d("HARManager", "recognise")
//        Log.d("HARManager", "$wakeLock")

        val inputFeature0 = TensorBuffer.createFixedSize(intArrayOf(1, WINDOWSIZE, 6), DataType.FLOAT32)
        inputFeature0.loadArray(data)

        // Runs model inference and gets result.
        val startTime = System.currentTimeMillis()
        val outputs = model?.process(inputFeature0)
        val executionTime = System.currentTimeMillis() - startTime
        val outputFeature0 = outputs?.outputFeature0AsTensorBuffer
        Log.d("HARManager", "recogniseHAR: model took $executionTime ms")
        Log.d("HARManager", "recogniseHAR: ${outputFeature0?.buffer?.let { toString(it) }}")
        val tensorLabel = outputFeature0?.let { TensorLabel(mutableListOf("0", "1", "2", "3"), it) };

        if (tensorLabel != null) {
            notifyRN(tensorLabel.mapWithFloatValue)
        }
    }

}

private fun FloatArray.resetArray(index: Int) {
    for (i in index until this.size) {
        this[i] = 0F
    }
}

private fun FloatArray.rotateArray(distance: Int) {
    Log.d("HARManager", "rotateArray")
    val list = this.toList()
    Collections.rotate(list, distance)
    for (i in this.indices) {
        this[i] = list[i]
    }
}

private fun TensorBuffer.loadBuffer(data: FloatArray) {
    val byteBuffer = ByteBuffer.allocate(data.size * 4)
    val sb = StringBuilder()
    var i = 0
    data.forEach {
        val int = java.lang.Float.floatToIntBits(it)
        val bytes = ByteBuffer.allocate(java.lang.Float.BYTES).putInt(int).array()
        byteBuffer.put(bytes)
        if (i == 0) {
            bytes.forEach { sb.append("${it.toUByte()}.") }
            Log.d("HARManager", "loadBuffer: $it, $int, $sb")
        }
        i += 1
    }
    loadBuffer(byteBuffer)
}

class HARPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        val modules = ArrayList<NativeModule>()
        modules.add(HARManager(reactContext))
        return modules
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): MutableList<ViewManager<View, ReactShadowNode<*>>> {
        return Collections.emptyList()
    }

}