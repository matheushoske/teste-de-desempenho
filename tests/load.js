import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '1m', target: 50 },
        { duration: '2m', target: 50 },
        { duration: '30s', target: 0 }
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01'],
        http_reqs: ['rate>0']
    }
};

const BASE_URL = 'http://localhost:3000';

export default function () {
    const payload = JSON.stringify({
        items: [
            { id: 1, quantity: 2, price: 29.99 },
            { id: 2, quantity: 1, price: 49.99 }
        ],
        customerId: Math.floor(Math.random() * 1000)
    });

    const params = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const response = http.post(`${BASE_URL}/checkout/simple`, payload, params);
    
    let body = {};
    try {
        body = JSON.parse(response.body);
    } catch (e) {
        body = {};
    }
    
    check(response, {
        'status is 201': (r) => r.status === 201,
        'response has id': () => body.id !== undefined,
        'response has status APPROVED': () => body.status === 'APPROVED',
        'response has processingTime': () => body.processingTime !== undefined
    });
    
    sleep(1);
}

