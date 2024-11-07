import { Session } from '@wharfkit/session';

export class ContractService {
  private readonly contractAccount = 'token.stake';

  constructor(private session: Session) {}
