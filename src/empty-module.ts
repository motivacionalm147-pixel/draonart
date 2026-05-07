export const FormData = window.FormData;
export const Blob = window.Blob;
export const File = window.File;
export const formDataToBlob = async (formData) => {
  return new Blob([new URLSearchParams(formData).toString()], { type: 'application/x-www-form-urlencoded' });
};
export default {};
