import Constants, { ExecutionEnvironment } from 'expo-constants';
import { NativeModules } from 'react-native';

function detectExpoGo(): boolean {
  if (Constants.appOwnership === 'expo') return true;
  if (Constants.expoGoConfig != null) return true;
  if (
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient &&
    !NativeModules.EXDevLauncher
  ) {
    return true;
  }
  return false;
}

export const isExpoGo = detectExpoGo();
