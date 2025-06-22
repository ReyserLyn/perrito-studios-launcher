import { HeliosDistribution } from 'perrito-core/common'

export default interface DistributionAPI {
  getDistribution: () => Promise<{
    success: boolean
    distribution: HeliosDistribution
    error?: string
  }>
}
