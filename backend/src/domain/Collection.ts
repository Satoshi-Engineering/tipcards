export default class Collection<T> {
  public readonly data: T[]
  public filter: (value: T) => boolean = () => true
  public sort: (a: T, b: T) => number = () => 0
  public pagination: { offset: number, limit: number } = { offset: 0, limit: 0 }

  public constructor(data: T[]) {
    this.data = data
  }

  public get filteredAndSorted() {
    return this.data.filter(this.filter).sort(this.sort)
  }

  public get paginated() {
    if (this.pagination.limit > 0) {
      return this.filteredAndSorted.slice(this.pagination.offset, this.pagination.offset + this.pagination.limit)
    }
    return this.filteredAndSorted
  }
}
