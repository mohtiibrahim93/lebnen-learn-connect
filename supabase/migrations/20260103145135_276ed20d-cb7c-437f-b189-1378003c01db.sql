-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  tutor_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, tutor_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view their own conversations"
ON public.conversations FOR SELECT
USING (auth.uid() = student_id OR auth.uid() = tutor_id);

CREATE POLICY "Users can create conversations they're part of"
ON public.conversations FOR INSERT
WITH CHECK (auth.uid() = student_id OR auth.uid() = tutor_id);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.student_id = auth.uid() OR c.tutor_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their conversations"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.student_id = auth.uid() OR c.tutor_id = auth.uid())
  )
);

CREATE POLICY "Users can update their own messages"
ON public.messages FOR UPDATE
USING (auth.uid() = sender_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create index for faster queries
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_conversations_student_id ON public.conversations(student_id);
CREATE INDEX idx_conversations_tutor_id ON public.conversations(tutor_id);