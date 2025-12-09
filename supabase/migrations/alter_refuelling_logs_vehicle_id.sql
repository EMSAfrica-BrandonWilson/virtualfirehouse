ALTER TABLE "public"."03_ecc_01_edob_05_refuelling_logs"
ALTER COLUMN "vehicle_id" TYPE text USING "vehicle_id"::text;
