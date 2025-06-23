import { HeliosDistribution } from 'perrito-core/common'

type GetDistributionResponse =
  | { success: true; distribution: HeliosDistribution }
  | { success: false; error: string }

export default interface DistributionAPI {
  getDistribution: () => Promise<GetDistributionResponse>
}
