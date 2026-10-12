/**
 * AuthNavigator — the unauthenticated stack: Login, Register, Forgot Password,
 * and OTP verification. Mounted by RootNavigator when there is no session.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  ForgotPasswordScreen,
  LoginScreen,
  OtpVerificationScreen,
  RegisterScreen,
} from '../features/authentication';

const Stack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Otp" component={OtpVerificationScreen} />
    </Stack.Navigator>
  );
}

export default AuthNavigator;
