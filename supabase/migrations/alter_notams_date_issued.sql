alter table "public"."03_ecc_01_edob_06_notams" 
alter column date_issued type timestamp with time zone using date_issued::timestamp with time zone;