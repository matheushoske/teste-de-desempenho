import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 1 }
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01'],
        checks: ['rate==1.0']
    }
};

const BASE_URL = 'http://localhost:3000';

export default function () {
    const response = http.get(`${BASE_URL}/health`);
    
    check(response, {
        'status is 200': (r) => r.status === 200
    });
    
    if (response.status === 200) {
        let body = {};
        try {
            body = JSON.parse(response.body);
        } catch (e) {
            body = {};
        }
        
        check(response, {
            'response has status field': () => body.status === 'UP',
            'response has timestamp': () => body.timestamp !== undefined
        });
    }
    
    sleep(1);
}

