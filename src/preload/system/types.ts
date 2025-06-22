export default interface SystemAPI {
  trashItem: (filePath: string) => Promise<any>

  // Distribution events
  onDistributionIndexDone: (callback: (result: boolean) => void) => void
  removeDistributionListener: () => void
}
