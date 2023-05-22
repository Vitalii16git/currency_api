const PASSWORD_RULE =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d)(?=.*?[@$!%*?&]).{8,}$/;

const PASSWORD_RULE_MESSAGE =
  'Password should have 1 upper case, lower case letter along with a number and special character';

export const REGEX = {
  PASSWORD_RULE,
};

export const MESSAGES = {
  PASSWORD_RULE_MESSAGE,
};
