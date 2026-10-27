import config from 'config';
import { Response } from 'express';

import { Form } from '../components/form';
import { AppRequest } from '../definitions/appRequest';
import { RespondentRepresented } from '../definitions/case';
import { PageUrls, TranslationKeys } from '../definitions/constants';
import { FormContent, FormFields } from '../definitions/form';
import { getPageContent } from '../helpers/FormHelper';
import { returnValidUrl } from '../helpers/RouterHelpers';
import { isFieldFilledIn } from '../validators/validator';

export default class LipOrRepController {
  private readonly form: Form;
  private readonly lipOrRepContent: FormContent = {
    fields: {
      respondentRepresentedQuestion: {
        type: 'radios',
        label: l => l.legend,
        labelSize: 'l',
        labelHidden: false,
        classes: 'govuk-radios',
        id: 'lip-or-representative',
        values: [
          {
            label: l => l.radio1,
            value: RespondentRepresented.MYSELF,
          },
          {
            label: l => l.radio2,
            value: RespondentRepresented.SOMEONE_ELSE,
          },
          {
            label: l => l.radio3,
            value: RespondentRepresented.LEGAL_REP,
          },
        ],
        validator: isFieldFilledIn,
      },
    },
    submit: {
      text: l => l.continue,
    },
  };

  constructor() {
    this.form = new Form(<FormFields>this.lipOrRepContent.fields);
  }

  public post = (req: AppRequest, res: Response): void => {
    const redirectUrl = getRedirectUrl(req);
    res.redirect(returnValidUrl(redirectUrl));
  };

  public get = (req: AppRequest, res: Response): void => {
    const content = getPageContent(req, this.lipOrRepContent, [
      TranslationKeys.COMMON,
      TranslationKeys.LIP_OR_REPRESENTATIVE,
    ]);
    res.render(TranslationKeys.LIP_OR_REPRESENTATIVE, {
      ...content,
    });
  };
}

const getRedirectUrl = (req: AppRequest): string => {
  const { respondentRepresentedQuestion } = req.body;
  if (
    respondentRepresentedQuestion === RespondentRepresented.MYSELF ||
    respondentRepresentedQuestion === RespondentRepresented.SOMEONE_ELSE
  ) {
    return PageUrls.CASE_NUMBER_CHECK;
  } else if (respondentRepresentedQuestion === RespondentRepresented.LEGAL_REP) {
    return process.env.MANAGE_CASE_URL ?? config.get('services.manageCase.url');
  } else {
    return PageUrls.LIP_OR_REPRESENTATIVE;
  }
};
