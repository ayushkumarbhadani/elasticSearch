"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const elasticsearch_1 = require("@elastic/elasticsearch");
const cors_1 = __importDefault(require("cors"));
const client = new elasticsearch_1.Client({
    node: 'http://localhost:9200',
    auth: {
        username: process.env.USERNAME || "",
        password: process.env.PASSWORD || ""
    }
});
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
function createIndex() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield client.indices.create({
                index: 'sample_index'
            });
            console.log('Index created:', response);
        }
        catch (error) {
            console.error('Error creating index:', error);
        }
    });
}
createIndex();
function indexSampleDocuments() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = [
                { index: { _index: 'sample_index', _id: '1' } },
                { name: 'John Doe', age: 30, occupation: 'Software Engineer' },
                { index: { _index: 'sample_index', _id: '2' } },
                { name: 'Jane Smith', age: 25, occupation: 'Data Scientist' }
            ];
            const response = yield client.bulk({ refresh: true, body });
            console.log('Documents indexed:', response);
        }
        catch (error) {
            console.error('Error indexing documents:', error);
        }
    });
}
indexSampleDocuments();
app.get('/api/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Received request for /api/users');
    const page = Number(req.query.page) || 1;
    const size = Number(req.query.size) || 10;
    const from = (page - 1) * size;
    try {
        const result = yield client.search({
            index: 'sample_index',
            body: {
                from,
                size,
                query: {
                    match_all: {}
                }
            }
        });
        console.log('Elasticsearch search result:', result);
        if (!result.hits || !result.hits.hits) {
            console.error('Unexpected Elasticsearch response format:', result);
            res.status(500).send('Unexpected Elasticsearch response format');
            return;
        }
        const users = result.hits.hits.map((hit) => (Object.assign({ id: hit._id }, hit._source)));
        console.log('Extracted users:', users);
        res.json(users);
    }
    catch (error) {
        console.error('Error during Elasticsearch query:', error);
        res.status(500).send('Internal Server Error');
    }
}));
app.put('/api/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Received request to update user with id ${req.params.id}`);
    try {
        const { id } = req.params;
        const { name, age, occupation } = req.body;
        const response = yield client.update({
            index: 'sample_index',
            id,
            body: {
                doc: {
                    name,
                    age,
                    occupation
                }
            }
        });
        console.log('Elasticsearch update response:', response);
        res.json({ message: 'User updated successfully' });
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Internal Server Error');
    }
}));
app.delete('/api/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const result = yield client.delete({
            index: 'sample_index',
            id
        });
        console.log('Elasticsearch delete result:', result);
        res.status(200).send('User deleted');
    }
    catch (error) {
        console.error('Error during Elasticsearch delete:', error);
        res.status(500).send('Internal Server Error');
    }
}));
app.get('/api/users/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Received search request:', req.query);
    const q = req.query.q;
    try {
        const result = yield client.search({
            index: 'sample_index',
            body: {
                query: {
                    multi_match: {
                        query: q,
                        fields: ['name', 'occupation']
                    }
                }
            }
        });
        console.log('Elasticsearch search result:', result);
        if (!result.hits || !result.hits.hits) {
            console.error('Unexpected Elasticsearch response format:', result);
            res.status(500).send('Unexpected Elasticsearch response format');
            return;
        }
        const users = result.hits.hits.map((hit) => hit._source);
        console.log('Extracted users:', users);
        res.json(users);
    }
    catch (error) {
        console.error('Error during Elasticsearch query:', error);
        res.status(500).send('Internal Server Error');
    }
}));
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
