-- Rename call_taker_id to call_taker_name in 03_ecc_03_01_Incident_Call_Taking
ALTER TABLE "03_ecc_03_01_Incident_Call_Taking" 
RENAME COLUMN "call_taker_id" TO "call_taker_name";

-- Rename dispatcher_id to dispatcher_name in 03_ecc_03_02_Incident_Call_Dispatching
ALTER TABLE "03_ecc_03_02_Incident_Call_Dispatching" 
RENAME COLUMN "dispatcher_id" TO "dispatcher_name";

-- Rename call_taker_id to call_taker_name in 03_ecc_03_05_Incident_Cancellations
ALTER TABLE "03_ecc_03_05_Incident_Cancellations" 
RENAME COLUMN "call_taker_id" TO "call_taker_name";
