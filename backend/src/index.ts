import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { Client } from '@elastic/elasticsearch';
import cors from 'cors';


const client = new Client({
  node: 'http://localhost:9200',
  auth: {
    username: process.env.USERNAME || "",
    password: process.env.PASSWORD || ""
  }
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

async function createIndex() {
  try {
    const response = await client.indices.create({
      index: 'sample_index'
    });
    console.log('Index created:', response);
  } catch (error) {
    console.error('Error creating index:', error);
  }
}

createIndex();

async function indexSampleDocuments() {
  try {
    const body = [
      { index: { _index: 'sample_index', _id: '1' } },
      { name: 'John Doe', age: 30, occupation: 'Software Engineer' },
      { index: { _index: 'sample_index', _id: '2' } },
      { name: 'Jane Smith', age: 25, occupation: 'Data Scientist' }
    ];

    const response = await client.bulk({ refresh: true, body });
    console.log('Documents indexed:', response);
  } catch (error) {
    console.error('Error indexing documents:', error);
  }
}

indexSampleDocuments();

app.get('/api/users', async (req: Request, res: Response) => {
  console.log('Received request for /api/users');
  
  const page = Number(req.query.page) || 1;
  const size = Number(req.query.size) || 10;
  const from = (page - 1) * size;

  try {
    const result = await client.search({
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

    const users = result.hits.hits.map((hit: any) => ({ id: hit._id, ...hit._source }));
    console.log('Extracted users:', users);
    res.json(users);
  } catch (error) {
    console.error('Error during Elasticsearch query:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.put('/api/users/:id', async (req: Request, res: Response) => {
  console.log(`Received request to update user with id ${req.params.id}`);
  try {
    const { id } = req.params;
    const { name, age, occupation } = req.body;

    const response = await client.update({
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
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.delete('/api/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await client.delete({
      index: 'sample_index',
      id
    });
    console.log('Elasticsearch delete result:', result);
    res.status(200).send('User deleted');
  } catch (error) {
    console.error('Error during Elasticsearch delete:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/api/users/search', async (req: Request, res: Response) => {
  console.log('Received search request:', req.query);
  const q  = req.query.q as string;
  try {
    const result = await client.search({
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
    
    const users = result.hits.hits.map((hit: any) => hit._source);
    console.log('Extracted users:', users);
    res.json(users);
  } catch (error) {
    console.error('Error during Elasticsearch query:', error);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
