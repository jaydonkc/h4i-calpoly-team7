export class AccountRequestError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "AccountRequestError";
  }
}
