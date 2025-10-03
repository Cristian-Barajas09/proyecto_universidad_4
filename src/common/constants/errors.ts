export enum ApplicationErrors {
  OLD_PASSWORD_INCORRECT = 'OLD_PASSWORD_INCORRECT',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
}

export type ApplicationErrorKey = keyof typeof ApplicationErrors;

export const errorMessages: Record<ApplicationErrorKey, string> = {
  [ApplicationErrors.OLD_PASSWORD_INCORRECT]:
    'La contraseña antigua es incorrecta',

  [ApplicationErrors.RESOURCE_NOT_FOUND]: 'Recurso no encontrado',
};
