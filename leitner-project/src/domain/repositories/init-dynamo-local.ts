import { DynamoDB } from 'aws-sdk';

async function createLocalTable() {
  const dynamodb = new DynamoDB({
    region: 'localhost',
    endpoint: 'http://localhost:8000',
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test'
    }
  });

  try {
    await dynamodb.createTable({
      TableName: 'cards-table-local',
      KeySchema: [
        { AttributeName: 'PK', KeyType: 'HASH' },
        { AttributeName: 'SK', KeyType: 'RANGE' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'PK', AttributeType: 'S' },
        { AttributeName: 'SK', AttributeType: 'S' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    }).promise();
    console.log('Table créée avec succès');
  } catch (error) {
    console.error('Erreur lors de la création de la table:', error);
  }
}

createLocalTable();