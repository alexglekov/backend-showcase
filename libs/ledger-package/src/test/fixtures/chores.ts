import { AccountService } from '../../internal-services/account.service';
import { LedgerPrismaService } from '../../internal-services/prisma.service';

export async function initDatabaseAfterEach({
  accountService,
}: {
  accountService: AccountService;
}) {
  await accountService.createIfNotExistSystemAccounts();
}

export async function cleanDatabaseAfterEach(prismaService: LedgerPrismaService) {
  await prismaService.entry.deleteMany();
  await prismaService.journal.deleteMany();
  await prismaService.balance.deleteMany();
  await prismaService.account.deleteMany();
}
