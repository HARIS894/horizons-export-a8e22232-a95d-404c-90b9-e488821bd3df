import { TEMPLATE_META_CATEGORIES, TEMPLATE_STATUSES } from '../types/templateTypes';

const templateNamePattern = /^[a-z0-9_]+$/;
const phonePattern = /^\+?[1-9]\d{7,14}$/;
const urlPattern = /^https?:\/\//i;
const promotionalKeywords = ['discount', 'offer', 'limited period', 'book now', 'free', 'exclusive'];
const riskyHealthcareKeywords = ['guarantee', 'cure', '100% recovery', 'instant result'];

const getHeaderState = (draft) => draft.header || { type: draft.headerType || 'None', content: draft.headerContent || '' };

const getVariableDefinitions = (draft) => {
  if (!Array.isArray(draft.variables)) {
    return [];
  }

  return draft.variables.map((variable, index) => {
    if (typeof variable === 'string') {
      return {
        id: `var-${index + 1}`,
        token: variable,
        name: `Variable ${index + 1}`,
        sampleValue: '',
        description: '',
      };
    }

    return variable;
  });
};

const extractVariableTokens = (body) => String(body || '').match(/\{\{\d+\}\}/g) || [];

const buildQualityLevel = (score) => {
  if (score <= 1) {
    return 'LOW';
  }

  if (score <= 3) {
    return 'MEDIUM';
  }

  return 'HIGH';
};

const inferRecommendedMetaCategory = (draft) => {
  const text = `${draft.purpose || ''} ${draft.body || ''} ${draft.internalCategory || draft.category || ''}`.toLowerCase();

  if (/otp|verification|authentication|password|login/.test(text)) {
    return 'AUTHENTICATION';
  }

  if (promotionalKeywords.some((keyword) => text.includes(keyword))) {
    return 'MARKETING';
  }

  return 'UTILITY';
};

const validateButtons = (buttons) => {
  const fieldErrors = {};
  const blockingIssues = [];

  if ((buttons || []).length > 3) {
    blockingIssues.push('A template cannot contain more than 3 buttons in this local model.');
  }

  (buttons || []).forEach((button) => {
    if (!button?.label?.trim()) {
      fieldErrors[`button-${button.id}-label`] = 'Button label is required.';
    }

    if (button?.type === 'Website CTA' && !urlPattern.test(button?.value || '')) {
      fieldErrors[`button-${button.id}-value`] = 'Website CTA requires a valid URL starting with http or https.';
    }

    if (button?.type === 'Phone CTA' && !phonePattern.test(button?.value || '')) {
      fieldErrors[`button-${button.id}-value`] = 'Phone CTA requires a valid phone number.';
    }
  });

  return { fieldErrors, blockingIssues };
};

export const validateTemplateDraft = (draft) => {
  const fieldErrors = {};
  const blockingIssues = [];
  const warnings = [];
  const passes = [];
  const header = getHeaderState(draft);
  const variables = getVariableDefinitions(draft);
  const body = String(draft.body || '').trim();
  const internalName = String(draft.internalName || draft.name || '').trim();

  if (!String(draft.name || '').trim()) {
    fieldErrors.name = 'Template name is required.';
    blockingIssues.push('Template name is required.');
  } else {
    passes.push('Template name valid');
  }

  if (!internalName) {
    fieldErrors.internalName = 'Internal name is required.';
    blockingIssues.push('Internal name is required.');
  } else if (!templateNamePattern.test(internalName)) {
    fieldErrors.internalName = 'Internal name must use lowercase letters, numbers, and underscores only.';
    blockingIssues.push('Invalid internal template name.');
  } else {
    passes.push('Internal name valid');
  }

  if (!body) {
    fieldErrors.body = 'Template body is required.';
    blockingIssues.push('Missing required body content.');
  } else {
    passes.push('Body valid');
  }

  if (header.type !== 'None' && !String(header.content || '').trim()) {
    fieldErrors.headerContent = 'Header content is required for the selected header type.';
    blockingIssues.push('Missing required header content.');
  }

  const selectedMetaCategory = draft.metaCategory || 'UTILITY';
  if (!TEMPLATE_META_CATEGORIES.includes(selectedMetaCategory)) {
    fieldErrors.metaCategory = 'A supported Meta category must be selected.';
    blockingIssues.push('Meta category must be selected.');
  }

  const usedTokens = extractVariableTokens(body);
  const variableNumbers = usedTokens.map((entry) => Number(entry.replace(/[^\d]/g, ''))).filter(Number.isFinite);
  if (variableNumbers.length) {
    const uniqueNumbers = [...new Set(variableNumbers)].sort((left, right) => left - right);
    const expected = Array.from({ length: uniqueNumbers.length }, (_, index) => index + 1);

    if (uniqueNumbers.some((value, index) => value !== expected[index])) {
      fieldErrors.variables = 'Variables in the body must be sequential, for example {{1}}, {{2}}, {{3}}.';
      blockingIssues.push('Invalid variable numbering.');
    }
  }

  const definedTokens = variables.map((variable) => variable.token);
  const missingDefinitions = [...new Set(usedTokens)].filter((token) => !definedTokens.includes(token));
  if (missingDefinitions.length) {
    fieldErrors.variables = `Missing variable configuration for: ${missingDefinitions.join(', ')}`;
    blockingIssues.push('Variables used in the body must be defined in the variable mapping section.');
  }

  const missingSamples = variables.filter((variable) => usedTokens.includes(variable.token) && !String(variable.sampleValue || '').trim());
  if (missingSamples.length) {
    warnings.push('Variable sample missing for one or more used variables.');
  } else if (usedTokens.length) {
    passes.push('Sample values present');
  }

  const buttonValidation = validateButtons(draft.buttons);
  Object.assign(fieldErrors, buttonValidation.fieldErrors);
  blockingIssues.push(...buttonValidation.blockingIssues);
  if (!buttonValidation.blockingIssues.length && !Object.keys(buttonValidation.fieldErrors).length) {
    passes.push('Buttons valid');
  }

  const recommendedMetaCategory = inferRecommendedMetaCategory(draft);
  if (selectedMetaCategory !== recommendedMetaCategory) {
    warnings.push('Possible category mismatch between template intent and the selected Meta category.');
  }

  const contentText = `${draft.purpose || ''} ${body}`.toLowerCase();
  if (promotionalKeywords.some((keyword) => contentText.includes(keyword))) {
    warnings.push('Promotional language detected. Review whether this belongs in a marketing category.');
  }

  if (riskyHealthcareKeywords.some((keyword) => contentText.includes(keyword))) {
    warnings.push('Potential healthcare policy concern detected. Avoid guarantees or medical promises.');
  } else {
    passes.push('Healthcare-safe wording looks operational');
  }

  const qualityChecks = {
    messageClarity: buildQualityLevel(body.length > 220 ? 2 : body ? 1 : 4),
    categoryFit: buildQualityLevel(warnings.some((message) => message.includes('category mismatch')) ? 3 : 1),
    variableQuality: buildQualityLevel(missingSamples.length ? 2 : usedTokens.length ? 1 : 2),
    promotionalLanguage: buildQualityLevel(promotionalKeywords.some((keyword) => contentText.includes(keyword)) ? 2 : 1),
    healthcareSafety: buildQualityLevel(riskyHealthcareKeywords.some((keyword) => contentText.includes(keyword)) ? 3 : 1),
    ctaQuality: buildQualityLevel(Object.keys(buttonValidation.fieldErrors).length ? 2 : 1),
    potentialPolicyRisk: buildQualityLevel(warnings.length > 2 ? 3 : warnings.length ? 2 : 1),
  };

  const lifecycleStatus = blockingIssues.length ? TEMPLATE_STATUSES.VALIDATING : TEMPLATE_STATUSES.READY_TO_SUBMIT;
  const errors = { ...fieldErrors };

  return {
    errors,
    fieldErrors,
    blockingIssues,
    warnings,
    passes,
    qualityChecks,
    usedVariables: usedTokens,
    variables,
    recommendedMetaCategory,
    readyForMetaReview: !blockingIssues.length,
    readinessLabel: blockingIssues.length ? 'Needs fixes before Meta review' : 'Ready for Meta review',
    lifecycleStatus,
  };
};

export const getDraftLifecycleStatus = (assessmentOrErrors, currentStatus = TEMPLATE_STATUSES.DRAFT) => {
  if ([
    TEMPLATE_STATUSES.SUBMITTED,
    TEMPLATE_STATUSES.PENDING,
    TEMPLATE_STATUSES.APPROVED,
    TEMPLATE_STATUSES.REJECTED,
    TEMPLATE_STATUSES.PAUSED,
    TEMPLATE_STATUSES.DISABLED,
  ].includes(currentStatus)) {
    return currentStatus;
  }

  if (assessmentOrErrors?.blockingIssues) {
    return assessmentOrErrors.blockingIssues.length ? TEMPLATE_STATUSES.VALIDATING : TEMPLATE_STATUSES.READY_TO_SUBMIT;
  }

  const errorCount = Object.keys(assessmentOrErrors || {}).length;
  if (errorCount > 0) {
    return TEMPLATE_STATUSES.VALIDATING;
  }

  return TEMPLATE_STATUSES.READY_TO_SUBMIT;
};