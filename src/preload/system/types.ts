export default interface SystemAPI {
  trashItem: (filePath: string) => Promise<any>
  showToast: (type: string, message: string) => void
  ping: () => void

  // Distribution events
  onDistributionIndexDone: (callback: (result: boolean) => void) => void
  removeDistributionListener: () => void
}
