import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';

module.exports.user = user => {
  return firestore().collection('users').doc(user.uid);
};

module.exports.userExercises = user => {
  return firestore().collection(`users/${user.uid}/exercises`);
};

module.exports.userSteps = user => {
  return firestore().collection(`users/${user.uid}/steps`);
};

module.exports.serverTimestamp = () => {
  return firebase.firestore.FieldValue.serverTimestamp();
};
