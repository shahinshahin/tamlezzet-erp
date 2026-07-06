import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography, Avatar,
  Paper, CircularProgress, Divider, Chip, IconButton, Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useSnackbar } from 'notistack';
import { aiApi } from '../../api/endpoints';
import { usePageTitle } from '../../hooks/usePageTitle';

interface Message { role: 'user' | 'assistant'; content: string; timestamp: string; }

const QUICK_PROMPTS = [
  "What are today's sales and outstanding payments?",
  "Give me a summary of this month's expenses by category",
  "Which customers have overdue invoices?",
  "What shipments are arriving in the next 30 days?",
  "Predict next month's cash flow based on trends",
  "Which farmers have the highest quality rating?",
];

export default function AiAssistantPage() {
  usePageTitle('AI Assistant');
  const { enqueueSnackbar } = useSnackbar();
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "Hello! I'm your TamLezzet business assistant. I have access to your live business data — sales, expenses, shipments, inventory and more. Ask me anything about your operations.",
    timestamp: new Date().toLocaleTimeString(),
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', content: text, timestamp: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await aiApi.query(text);
      const aiMsg: Message = { role: 'assistant', content: res.data.data, timestamp: new Date().toLocaleTimeString() };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errMsg: Message = { role: 'assistant', content: 'Sorry, I encountered an error. Please check your OpenAI API key configuration.', timestamp: new Date().toLocaleTimeString() };
      setMessages(prev => [...prev, errMsg]);
    } finally { setLoading(false); }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    enqueueSnackbar('Copied to clipboard', { variant: 'success' });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)' }}>
      <Box mb={2}>
        <Typography variant="h5" fontWeight={700}>AI Business Assistant</Typography>
        <Typography variant="body2" color="text.secondary">Powered by GPT-4 · Has access to your live business data</Typography>
      </Box>

      {/* Quick prompts */}
      <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
        {QUICK_PROMPTS.map(p => (
          <Chip
            key={p} label={p} size="small" variant="outlined"
            onClick={() => sendMessage(p)}
            sx={{ cursor: 'pointer', fontSize: 11, '&:hover': { bgcolor: 'primary.light', color: 'white', borderColor: 'primary.light' } }}
          />
        ))}
      </Box>

      {/* Chat messages */}
      <Card sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
          {messages.map((msg, idx) => (
            <Box key={idx} display="flex" gap={1.5} mb={2.5} flexDirection={msg.role === 'user' ? 'row-reverse' : 'row'}>
              <Avatar
                sx={{
                  width: 36, height: 36, flexShrink: 0,
                  bgcolor: msg.role === 'user' ? 'secondary.main' : 'primary.main',
                }}
              >
                {msg.role === 'user' ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
              </Avatar>
              <Box maxWidth="75%">
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5, borderRadius: 2,
                    bgcolor: msg.role === 'user' ? 'secondary.main' : '#f5f7f5',
                    color: msg.role === 'user' ? 'white' : 'text.primary',
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: 13 }}>
                    {msg.content}
                  </Typography>
                </Paper>
                <Box display="flex" alignItems="center" gap={0.5} mt={0.3} justifyContent={msg.role === 'user' ? 'flex-end' : 'flex-start'}>
                  <Typography variant="caption" color="text.disabled">{msg.timestamp}</Typography>
                  {msg.role === 'assistant' && (
                    <Tooltip title="Copy">
                      <IconButton size="small" onClick={() => copyToClipboard(msg.content)} sx={{ p: 0.3 }}>
                        <ContentCopyIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
          {loading && (
            <Box display="flex" gap={1.5} mb={2}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}><SmartToyIcon fontSize="small" /></Avatar>
              <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f5f7f5', display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">Thinking…</Typography>
              </Paper>
            </Box>
          )}
          <div ref={bottomRef} />
        </Box>

        <Divider />
        <Box p={2} display="flex" gap={1.5} alignItems="flex-end">
          <TextField
            fullWidth multiline maxRows={4}
            placeholder="Ask about your business data, expenses, shipments, payments…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            disabled={loading}
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          <Button
            variant="contained" onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            sx={{ minWidth: 48, height: 40, borderRadius: 3, px: 1.5 }}
          >
            <SendIcon fontSize="small" />
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
