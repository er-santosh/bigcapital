import { Service, Inject } from 'typedi';
import HasTenancyService from '@/services/Tenancy/TenancyService';
import { FeaturesConfigure } from './constants';
import { IFeatureAllItem } from '@/interfaces';
import { FeaturesConfigureManager } from './FeaturesConfigureManager';

@Service()
export class FeaturesSettingsDriver {
  @Inject()
  private tenancy: HasTenancyService;

  @Inject()
  private configure: FeaturesConfigureManager;

  /**
   * Turns-on the given feature name.
   * @param   {number} tenantId
   * @param   {string} feature
   * @returns {Promise<void>}
   */
  async turnOn(tenantId: number, feature: string) {
    const settings = this.tenancy.settings(tenantId);

    settings.set({ group: 'features', key: feature, value: true });
  }

  /**
   * Turns-off the given feature name.
   * @param   {number} tenantId
   * @param   {string} feature
   * @returns {Promise<void>}
   */
  async turnOff(tenantId: number, feature: string) {
    const settings = this.tenancy.settings(tenantId);

    settings.set({ group: 'features', key: feature, value: false });
  }

  /**
   * Detarmines the given feature name is accessible.
   * @param   {number} tenantId
   * @param   {string} feature
   * @returns {Promise<boolean|null|undefined>}
   */
  async accessible(tenantId: number, feature: string) {
    const settings = this.tenancy.settings(tenantId);

    const defaultValue = this.configure.getFeatureConfigure(
      feature,
      'defaultValue'
    );
    const settingValue = settings.get(
      { group: 'features', key: feature },
      defaultValue
    );
    return settingValue;
  }

  /**
   * Retrieves the all features and their accessible value and default value.
   * @param   {number} tenantId
   * @returns {Promise<IFeatureAllItem>}
   */
  async all(tenantId: number): Promise<IFeatureAllItem[]> {
    const mappedOpers = FeaturesConfigure.map(async (featureConfigure) => {
      const { name, defaultValue } = featureConfigure;
      const isAccessible = await this.accessible(
        tenantId,
        featureConfigure.name
      );
      return { name, isAccessible, defaultAccessible: defaultValue };
    });
    return Promise.all(mappedOpers);
  }
}
