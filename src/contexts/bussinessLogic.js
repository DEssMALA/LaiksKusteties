import GoogleFit, {Scopes} from 'react-native-google-fit';

import FS from '../contexts/firestore';
import {get as getRemoteConfig} from '../contexts/remoteConfig';

export const getTodayPoints = async user => {
  const exerciseConfig = getRemoteConfig('exercises');
  const today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  var points = 0;
  await FS.userExercises(user)
    .where('started', '>', today)
    .get()
    .then(snap => {
      snap.forEach(d => {
        var data = d.data();
        const p = data.count * exerciseConfig[data.type].pointsPerUnit;
        points += p;
      });
    })
    .catch(e => {
      console.log(e);
    });
  console.log('getTodayPoints', points);
  return points;
};

export const getTotalPoints = async user => {
  const exerciseConfig = getRemoteConfig('exercises');

  var points = 0;
  await FS.userExercises(user)
    .get()
    .then(snap => {
      snap.forEach(d => {
        var data = d.data();
        const p = data.count * exerciseConfig[data.type].pointsPerUnit;
        points += p;
      });
    })
    .catch(e => {
      console.log(e);
    });
  console.log('getTotalPoints', points);
  return points;
};

const authorizeGoogleFit = async () => {
  const options = {
    scopes: [
      Scopes.FITNESS_ACTIVITY_READ,
      Scopes.FITNESS_ACTIVITY_WRITE,
      Scopes.FITNESS_BODY_READ,
      Scopes.FITNESS_BODY_WRITE,
    ],
  };
  await GoogleFit.checkIsAuthorized();
  await GoogleFit.authorize(options)
    .then(authResult => {
      if (authResult.success) {
        console.log('authorizeGoogleFit AUTH_SUCCESS');
      } else {
        console.log('authorizeGoogleFit AUTH_DENIED', authResult.message);
      }
    })
    .catch(() => {
      console.log('authorizeGoogleFit AUTH_ERROR');
    });

  await GoogleFit.checkIsAuthorized();
  // WAR: for some reason isAuthorised is not set before checkIsAuthorised() returns
  await new Promise(r => setTimeout(r, 1000));
  console.log('authorizeGoogleFit', GoogleFit.isAuthorized);
  return GoogleFit.isAuthorized;
};

export const getTodaySteps = async () => {
  var stepCount = 0;

  if (await authorizeGoogleFit()) {
    const res = await GoogleFit.getDailySteps();
    var steps = 0;
    res.forEach(r => {
      console.log(r);
      if (r.steps && r.steps[0] && r.steps[0].value && r.steps[0].value > steps)
        steps = r.steps[0].value;
      console.log(steps);
    });
    stepCount = steps;
  }

  console.log('bussinessLogic::getTodaySteps', stepCount);

  return stepCount;
};

export const saveDailySteps = (function () {
  var lastExecuted = new Date();
  lastExecuted.setTime(0);

  return async function (user) {
    if (!(await authorizeGoogleFit())) return;
    console.log('bussinessLogic::saveDailySteps lastExecuted', lastExecuted);
    const nowTime = new Date();
    const diffTime = nowTime.getTime() - lastExecuted.getTime();
    console.log('bussinessLogic::saveDailySteps diffTime', diffTime);

    // Check if last executed less than 1h before
    if (diffTime < 1000 * 60 * 60) return;

    lastExecuted = nowTime;
    const resp = await GoogleFit.getWeeklySteps();
    console.log('bussinessLogic::saveDailySteps');
    var index = 0;
    var steps = 0;
    resp.forEach((r, i) => {
      // console.log(r);
      if (
        r.steps &&
        r.steps[0] &&
        r.steps[0].value &&
        r.steps[0].value > steps
      ) {
        steps = r.steps[0].value;
        index = i;
      }
    });
    const stepList = resp[index].steps;
    console.log(stepList);

    for (let i = 0; i < stepList.length - 1; i++) {
      const day = stepList[i];
      await FS.userSteps(user).doc(day.date).set({
        count: day.value,
      });
    }
  };
})();
