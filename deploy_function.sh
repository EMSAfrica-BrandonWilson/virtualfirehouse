# Deploy Edge Function to Supabase
# This script helps deploy the edge function using curl

# Configuration
SUPABASE_PROJECT_ID="yhrecxzygcapozirquzw"
FUNCTION_NAME="vehicle-station-assignments-crud"

# Get access token from environment or user input
echo "To deploy the edge function, you need to:"
echo "1. Go to https://app.supabase.com/project/${SUPABASE_PROJECT_ID}/settings/api"
echo "2. Copy your access token (anon key)"
echo "3. Run the following command with your token:"
echo ""
echo "curl -X POST \"https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_ID}/functions/${FUNCTION_NAME}/deploy\" \\"
echo "  -H \"Authorization: Bearer YOUR_ACCESS_TOKEN\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  --data-binary @supabase/functions/${FUNCTION_NAME}/index.ts"
echo ""
echo "Or alternatively, you can deploy through the Supabase dashboard:"
echo "1. Go to https://app.supabase.com/project/${SUPABASE_PROJECT_ID}/functions"
echo "2. Find the ${FUNCTION_NAME} function"
echo "3. Click 'Deploy' or update the code directly"
echo ""
echo "The function has been updated to use the new 'vehicle_assignments' table."