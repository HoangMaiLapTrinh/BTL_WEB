import { useState } from 'react';

const useLoginAndRegisterLogic = () => {
  const [isSignUpActive, setIsSignUpActive] = useState(false);

  const toggleToSignUp = () => setIsSignUpActive(true);
  const toggleToSignIn = () => setIsSignUpActive(false);

  return {
    isSignUpActive,
    toggleToSignUp,
    toggleToSignIn,
  };
};

export default useLoginAndRegisterLogic;
