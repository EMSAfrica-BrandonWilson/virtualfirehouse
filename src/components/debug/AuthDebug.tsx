import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminCheck } from '../../hooks/useAdminCheck';
import { supabase } from '../../lib/supabase';

const AuthDebug: React.FC = () => {
    const { user } = useAuth();
    const { isAdmin, isSystemAdmin, userRole, loading, error } = useAdminCheck();
    const [debugInfo, setDebugInfo] = useState<any>(null);
    const [testResult, setTestResult] = useState<any>(null);

    useEffect(() => {
        if (user) {
            setDebugInfo({
                userId: user.id,
                email: user.email,
                createdAt: user.created_at,
                lastSignIn: user.last_sign_in_at
            });
        }
    }, [user]);

    const testDebugEndpoint = async () => {
        try {
            const { data, error } = await supabase.functions.invoke('debug-auth-check', {
                body: {}
            });

            if (error) {
                setTestResult({ error: error.message });
            } else {
                setTestResult(data);
            }
        } catch (err: any) {
            setTestResult({ error: err.message });
        }
    };

    const testImageListEndpoint = async () => {
        try {
            const { data, error } = await supabase.functions.invoke('list-page-images', {
                body: {}
            });

            if (error) {
                setTestResult({ imageListError: error.message });
            } else {
                setTestResult({ imageListData: data });
            }
        } catch (err: any) {
            setTestResult({ imageListError: err.message });
        }
    };

    return (
        <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '20px', border: '2px solid #ccc' }}>
            <h2>Authentication Debug Panel</h2>
            
            <div style={{ marginBottom: '20px' }}>
                <h3>Auth Context Status:</h3>
                <pre>{JSON.stringify({ user: !!user, userEmail: user?.email }, null, 2)}</pre>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Admin Check Results:</h3>
                <pre>{JSON.stringify({ isAdmin, isSystemAdmin, userRole, loading, error }, null, 2)}</pre>
            </div>

            {debugInfo && (
                <div style={{ marginBottom: '20px' }}>
                    <h3>User Debug Info:</h3>
                    <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
            )}

            <div style={{ marginBottom: '20px' }}>
                <button onClick={testDebugEndpoint} style={{ marginRight: '10px', padding: '10px' }}>
                    Test Debug Auth Endpoint
                </button>
                <button onClick={testImageListEndpoint} style={{ padding: '10px' }}>
                    Test Image List Endpoint
                </button>
            </div>

            {testResult && (
                <div style={{ marginBottom: '20px' }}>
                    <h3>Test Results:</h3>
                    <pre>{JSON.stringify(testResult, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default AuthDebug;