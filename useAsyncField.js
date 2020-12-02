import { useState } from "react";

/*
* @example
*  const [submitFirstName, firstNameMeta] = useAsyncField(value =>
*    patchUser({ firstName: value }, auth.userId),
*  );
*/
export const useAsyncField = fetchCall => {
  const [error, setError] = useState(null);
  const [inProgress, setInProgress] = useState(false);
  async function submit(...args) {
    setInProgress(true);
    const [, err] = await fetchCall(...args);
    setInProgress(false);
    setError(err);
  }
  function displayError(name) {
    if (error) {
      return error[name] ?? Object.values(error)[0] ?? "An error occurred";
    }
    return "";
  }
  return [submit, { error, inProgress, displayError }];
};
