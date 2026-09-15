const OWNER_PATTERN = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;
const REPOSITORY_PATTERN = /^[A-Za-z0-9._-]+$/;

export default function validateRequest(payload) {
    let request;

    try {
        request = typeof payload === 'string' ? JSON.parse(payload) : payload;
    } catch {
        throw new Error('Request payload must be valid JSON');
    }

    if (!request || typeof request !== 'object' || Array.isArray(request)) {
        throw new Error('Request payload must be a JSON object');
    }

    validateOwner(request.owner);
    validateRepository(request.repo);

    return request;
}

function validateOwner(owner) {
    if (typeof owner !== 'string' || owner.length < 1 || owner.length > 39 || !OWNER_PATTERN.test(owner)) {
        throw new Error('Owner must be 1-39 ASCII letters, digits, or single hyphens, and cannot begin or end with a hyphen');
    }
}

function validateRepository(repo) {
    if (typeof repo !== 'string' || repo.length < 1 || repo.length > 100 || !REPOSITORY_PATTERN.test(repo)) {
        throw new Error('Repository must be 1-100 ASCII letters, digits, periods, hyphens, or underscores');
    }
}