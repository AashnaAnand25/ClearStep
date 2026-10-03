import forms from "../../public/companion/forms.json";
export const FORMS = forms;
export const FORM_FIELDS = Object.fromEntries(
  forms.flatMap((form) =>
    form.fields.map((field) => [field.id, { ...field, formName: form.name, source: form.source }]),
  ),
);
export type FormFieldId = string;
export const FORM_SOURCE = forms[0]!.source;
