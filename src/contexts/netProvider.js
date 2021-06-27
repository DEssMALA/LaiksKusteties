import React from 'react';
import NetInfo from '@react-native-community/netinfo';
import Snackbar from 'react-native-snackbar';

export const NetContext = React.createContext();

export const NetProvider = ({children}) => {
  const [state, setState] = React.useState(NetInfo.useNetInfo());

  React.useEffect(() => {
    // Subscribe
    const unsubscribe = NetInfo.addEventListener(state => {
      setState(state);
      if (!state.isConnected)
        Snackbar.show({
          text: 'Nav interneta, lūdzu pieslēdzies pie interneta, lai lietotne darbotos pareizi.',
          duration: Snackbar.LENGTH_INDEFINITE,
          action: {
            text: 'Paslēpt',
            textColor: 'gray',
          },
        });
      else Snackbar.dismiss();
    });

    return unsubscribe;
  }, []);

  return <NetContext.Provider value={state}>{children}</NetContext.Provider>;
};
