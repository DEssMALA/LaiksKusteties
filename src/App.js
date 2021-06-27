import * as React from 'react';
import {Provider as PaperProvider} from 'react-native-paper';
import {NetProvider} from './contexts/netProvider';

import {AuthProvider} from './contexts/auth';
import Routes from './contexts/routes';

const App = () => {
  return (
    <PaperProvider>
      <NetProvider>
        <AuthProvider>
          <Routes />
        </AuthProvider>
      </NetProvider>
    </PaperProvider>
  );
};

export default App;
