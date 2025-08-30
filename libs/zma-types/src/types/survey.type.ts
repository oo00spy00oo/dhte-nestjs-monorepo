export enum SurveyType {
  NetPromoterScore = 'NPS',
  CustomerSatisfactionScore = 'CSAT',
  ProductMarketFit = 'PMF',
  CustomerEffortScore = 'CES',
  Onboarding = 'ONBOARDING',
  UserInterview = 'USER_INTERVIEW',
  OpenFeedback = 'OPEN_FEEDBACK',
}

export enum SurveyQuestionType {
  Text = 'TEXT',
  Rating = 'RATING',
  SingleChoice = 'SINGLE_CHOICE',
  MultipleChoice = 'MULTIPLE_CHOICE',
  YesNo = 'YES_NO',
  CTA = 'CTA',
}

export enum SurveyUiTemplate {
  Default = 'DEFAULT',
  Emoji = 'EMOJI',
  Stars = 'STARS',
  Faces = 'FACES',
  Scale = 'SCALE',
  CTA = 'CTA',
}
