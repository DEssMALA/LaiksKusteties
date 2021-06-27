import React from 'react';
import auth from '@react-native-firebase/auth';

export const AuthContext = React.createContext();

export const AuthProvider = ({children}) => {
  const [user, setUser] = React.useState(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login: (email, password) => {
          return auth().signInWithEmailAndPassword(email, password);
        },
        register: (email, password) => {
          return auth().createUserWithEmailAndPassword(email, password);
        },
        logout: () => {
          return auth().signOut();
        },
        update: user => {
          return auth().updateCurrentUser(user);
        },
        deleteUser: () => {
          return auth().currentUser.delete();
        },
        passwordReset: email => {
          return auth().sendPasswordResetEmail(email);
        },
      }}>
      {children}
    </AuthContext.Provider>
  );
};
