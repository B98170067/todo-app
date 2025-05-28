import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Todo App API',
            version: '1.0.0',
            description: 'Swagger documentation for Todo App backend',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local server'
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Todo: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            example: '6651540dd93c8b8f12345678'
                        },
                        title: {
                            type: 'string',
                            example: '買牛奶'
                        },
                        description: {
                            type: 'string',
                            example: '週五前記得買兩瓶鮮奶'
                        },
                        completed: {
                            type: 'boolean',
                            example: false
                        },
                        attachments: {
                            type: 'array',
                            items: {
                                type: 'string',
                                example: 'https://storage.googleapis.com/your-bucket/file.pdf'
                            }
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-05-28T12:34:56.000Z'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-05-28T13:45:00.000Z'
                        }
                    }
                },
                UploadResponse: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            example: '上傳成功'
                        },
                        fileUrl: {
                            type: 'string',
                            example: 'https://storage.googleapis.com/your-bucket/file.png'
                        },
                        todo: {
                            $ref: '#/components/schemas/Todo'
                        }
                    }
                },
                MultiUploadResponse: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            example: '上傳成功'
                        },
                        files: {
                            type: 'array',
                            items: {
                                type: 'string',
                                example: 'https://storage.googleapis.com/your-bucket/file.png'
                            }
                        },
                        todo: {
                            $ref: '#/components/schemas/Todo'
                        }
                    }
                },
                DeleteResponse: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            example: '刪除成功'
                        },
                        todo: {
                            $ref: '#/components/schemas/Todo'
                        }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            example: '找不到 Todo'
                        }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routes/*.js'], // 掃描註解
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
