import { Module } from "@nestjs/common";

import { DatabaseModule } from "../../platform/database/database.module";
import { AUTH_REPOSITORY } from "./application/auth.repository";
import { AuthService } from "./application/auth.service";
import { AuthController } from "./api/auth.controller";
import { AuthGuard, OptionalAuthGuard } from "./api/auth.guard";
import { PrismaAuthRepository } from "./infrastructure/prisma-auth.repository";

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    OptionalAuthGuard,
    {
      provide: AUTH_REPOSITORY,
      useClass: PrismaAuthRepository
    }
  ],
  exports: [AuthService, AuthGuard, OptionalAuthGuard]
})
export class AuthModule {}
