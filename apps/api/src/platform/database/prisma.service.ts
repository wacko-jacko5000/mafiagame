import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  async checkConnection(): Promise<boolean> {
    const rows = await this.$queryRaw<Array<{ result: number }>>(
      Prisma.sql`SELECT 1 as result`
    );

    return rows[0]?.result === 1;
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
