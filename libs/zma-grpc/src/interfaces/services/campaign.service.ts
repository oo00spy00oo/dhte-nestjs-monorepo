import { MicroserviceInput, CampaignServiceSubject } from '@zma-nestjs-monorepo/zma-types';
import {
  CampaignServiceInputMapper,
  CampaignServiceOutputMapper,
} from '@zma-nestjs-monorepo/zma-types/mappers/campaign';
import { Observable } from 'rxjs';

export interface CampaignService {
  campaignServiceGetCampaignById(
    input: MicroserviceInput<CampaignServiceInputMapper<CampaignServiceSubject.GetCampaignById>>,
  ): Observable<CampaignServiceOutputMapper<CampaignServiceSubject.GetCampaignById>>;

  campaignServiceGetAllCampaigns(
    input: MicroserviceInput<CampaignServiceInputMapper<CampaignServiceSubject.GetAllCampaigns>>,
  ): Observable<CampaignServiceOutputMapper<CampaignServiceSubject.GetAllCampaigns>>;

  campaignServiceUserRegisteredEvent(
    input: MicroserviceInput<
      CampaignServiceInputMapper<CampaignServiceSubject.UserRegisteredEvent>
    >,
  ): Observable<CampaignServiceOutputMapper<CampaignServiceSubject.UserRegisteredEvent>>;
}
