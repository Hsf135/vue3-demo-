
import OpenAI from 'openai';

// 初始化 OpenAI 客户端，指向阿里云 DashScope
// 注意：dangerouslyAllowBrowser: true 是必须的，因为我们在前端直接调用 API
// 生产环境中建议将 Key 存放在后端
export const getQwenClient = () => {
    const apiKey = import.meta.env.VITE_DASHSCOPE_API_KEY;
    if (!apiKey) return null;

    return new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        dangerouslyAllowBrowser: true
    });
};

/**
 * 调用 Qwen 模型
 * @param prompt 提示词
 * @param model 模型名称，默认 qwen-plus
 */
export async function callQwen(prompt: string, model = 'qwen-plus') {
    const client = getQwenClient();
    if (!client) {
        throw new Error('请先配置 VITE_DASHSCOPE_API_KEY');
    }

    try {
        const completion = await client.chat.completions.create({
            model: model,
            messages: [
                { role: 'user', content: prompt }
            ],
        });
        return completion.choices[0].message.content || '';
    } catch (error) {
        console.error('Qwen 调用失败:', error);
        throw error;
    }
}

/**
 * 流式调用 Qwen 模型
 */
export async function* callQwenStream(prompt: string, model = 'qwen-plus') {
    const client = getQwenClient();
    if (!client) {
        throw new Error('请先配置 VITE_DASHSCOPE_API_KEY');
    }

    try {
        const stream = await client.chat.completions.create({
            model: model,
            messages: [
                { role: 'user', content: prompt }
            ],
            stream: true,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                yield content;
            }
        }
    } catch (error) {
        console.error('Qwen 流式调用失败:', error);
        throw error;
    }
}
