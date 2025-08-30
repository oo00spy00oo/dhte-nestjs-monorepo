import { CampaignServiceSubject } from '../../../subjects';
import { KeyMapper } from '../../../types';
import {
  CampaignServiceGetAllCampaignsInput,
  CampaignServiceGetCampaignByIdInput,
  CampaignServiceUserRegisteredEventInput,
} from '../../inputs/campaign';
import {
  CampaignServiceCampaignOutput,
  CampaignServiceUserRegisteredEventOutput,
} from '../../models/campaign';

interface CampaignServiceMapper {
  [CampaignServiceSubject.GetCampaignById]: {
    [KeyMapper.Input]: CampaignServiceGetCampaignByIdInput;
    [KeyMapper.Output]: CampaignServiceCampaignOutput;
  };
  [CampaignServiceSubject.GetAllCampaigns]: {
    [KeyMapper.Input]: CampaignServiceGetAllCampaignsInput;
    [KeyMapper.Output]: {
      data: CampaignServiceCampaignOutput[];
    };
  };
  [CampaignServiceSubject.UserRegisteredEvent]: {
    [KeyMapper.Input]: CampaignServiceUserRegisteredEventInput;
    [KeyMapper.Output]: CampaignServiceUserRegisteredEventOutput;
  };
}

export type CampaignServiceInputMapper<T extends keyof CampaignServiceMapper> =
  CampaignServiceMapper[T][KeyMapper.Input];

export type CampaignServiceOutputMapper<T extends keyof CampaignServiceMapper> =
  CampaignServiceMapper[T][KeyMapper.Output];
