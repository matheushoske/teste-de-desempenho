import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '2m', target: 200 },
        { duration: '2m', target: 500 },
        { duration: '2m', target: 1000 }
    ],
    thresholds: {
        http_req_duration: ['p(95)<5000', 'p(99)<10000'],
        http_req_failed: ['rate<0.05']
    }
};

const BASE_URL = 'http://localhost:3000';

export default function () {
    const payload = JSON.stringify({
        transactionId: Math.floor(Math.random() * 100000),
        amount: Math.random() * 1000,
        currency: 'BRL'
    });

    const params = {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: '30s'
    };

    const response = http.post(`${BASE_URL}/checkout/crypto`, payload, params);
    
    let body = {};
    try {
        body = JSON.parse(response.body);
    } catch (e) {
        body = {};
    }
    
    check(response, {
        'status is 201': (r) => r.status === 201,
        'response has id': () => body.id !== undefined,
        'response has status SECURE_TRANSACTION': () => body.status === 'SECURE_TRANSACTION',
        'response has hash': () => body.hash !== undefined
    });
    
    sleep(1);
}

