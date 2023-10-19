-- AlterTable
CREATE SEQUENCE otp_otpid_seq;
ALTER TABLE "Otp" ALTER COLUMN "otpId" SET DEFAULT nextval('otp_otpid_seq');
ALTER SEQUENCE otp_otpid_seq OWNED BY "Otp"."otpId";

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
