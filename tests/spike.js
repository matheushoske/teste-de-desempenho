import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 10 },
        { duration: '10s', target: 300 },
        { duration: '1m', target: 300 },
        { duration: '10s', target: 10 }
    ],
    thresholds: {
        http_req_duration: ['p(95)<1000', 'p(99)<2000'],
        http_req_failed: ['rate<0.05']
    }
};

const BASE_URL = 'http://localhost:3000';

export default function () {
    const payload = JSON.stringify({
        items: [
            { id: Math.floor(Math.random() * 100), quantity: Math.floor(Math.random() * 5) + 1, price: Math.random() * 100 },
            { id: Math.floor(Math.random() * 100), quantity: Math.floor(Math.random() * 5) + 1, price: Math.random() * 100 }
        ],
        customerId: Math.floor(Math.random() * 10000),
        promoCode: 'FLASH_SALE_2024'
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

