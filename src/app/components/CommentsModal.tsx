import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageCircle, Send, Edit2, Trash2, Reply, MoreVertical } from 'lucide-react';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: Date;
  replies: Reply[];
}

interface Reply {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: Date;
}

interface CommentsModalProps {
  volunteer: {
    id: string;
    name: string;
    profileImage: string;
  };
  onClose: () => void;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar: string;
}

export default function CommentsModal({ 
  volunteer, 
  onClose, 
  currentUserId, 
  currentUserName,
  currentUserAvatar 
}: CommentsModalProps) {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      userId: 'user1',
      userName: 'Sarah K.',
      userAvatar: '👤',
      text: 'Marcus is amazing! He took great care of my golden retriever and sent regular updates.',
      timestamp: new Date('2024-12-07T10:30:00'),
      replies: [
        {
          id: 'r1',
          userId: 'v1',
          userName: 'Marcus R.',
          userAvatar: '🐕',
          text: 'Thank you Sarah! It was wonderful walking Max. He\'s such a good boy!',
          timestamp: new Date('2024-12-07T11:15:00')
        }
      ]
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Raj P.',
      userAvatar: '🙋',
      text: 'Very professional and punctual. My dog seems happier after the walks!',
      timestamp: new Date('2024-12-06T16:45:00'),
      replies: []
    }
  ]);

  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showMenuId, setShowMenuId] = useState<string | null>(null);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      userId: currentUserId,
      userName: currentUserName,
      userAvatar: currentUserAvatar,
      text: newComment,
      timestamp: new Date(),
      replies: []
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleEditComment = (commentId: string) => {
    if (!editText.trim()) return;

    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, text: editText };
      }
      return comment;
    }));

    setEditingCommentId(null);
    setEditText('');
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter(comment => comment.id !== commentId));
    setShowMenuId(null);
  };

  const handleAddReply = (commentId: string) => {
    if (!replyText.trim()) return;

    const reply: Reply = {
      id: Date.now().toString(),
      userId: currentUserId,
      userName: currentUserName,
      userAvatar: currentUserAvatar,
      text: replyText,
      timestamp: new Date()
    };

    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, replies: [...comment.replies, reply] };
      }
      return comment;
    }));

    setReplyingToId(null);
    setReplyText('');
  };

  const handleDeleteReply = (commentId: string, replyId: string) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: comment.replies.filter(reply => reply.id !== replyId)
        };
      }
      return comment;
    }));
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" 
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-sm max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="border-b border-gray-200 p-6 flex items-center justify-between bg-gradient-to-r from-[#6B4423]/5 to-[#4A7C59]/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6B4423]/10 to-[#8B6F47]/10 flex items-center justify-center text-xl">
                {volunteer.profileImage}
              </div>
              <div>
                <h2 className="text-gray-900">comments for {volunteer.name}</h2>
                <p className="text-gray-600">{comments.length} comment{comments.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-sm transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {comments.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600">no comments yet</p>
                <p className="text-gray-500 text-sm">be the first to share your experience!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="space-y-3">
                  {/* Main Comment */}
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6B4423]/10 to-[#8B6F47]/10 flex items-center justify-center flex-shrink-0">
                      {comment.userAvatar}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-sm p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="text-gray-900">{comment.userName}</div>
                            <div className="text-gray-500 text-sm">{formatTimestamp(comment.timestamp)}</div>
                          </div>
                          {comment.userId === currentUserId && (
                            <div className="relative">
                              <button
                                onClick={() => setShowMenuId(showMenuId === comment.id ? null : comment.id)}
                                className="p-1 hover:bg-gray-200 rounded-sm transition-colors"
                              >
                                <MoreVertical className="w-4 h-4 text-gray-600" />
                              </button>
                              {showMenuId === comment.id && (
                                <div className="absolute right-0 top-8 bg-white border border-gray-300 rounded-sm shadow-lg py-1 min-w-[120px] z-10">
                                  <button
                                    onClick={() => {
                                      setEditingCommentId(comment.id);
                                      setEditText(comment.text);
                                      setShowMenuId(null);
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-gray-900"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                    edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    delete
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {editingCommentId === comment.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-[#6B4423] resize-none"
                              rows={3}
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditComment(comment.id)}
                                className="px-3 py-1 bg-gradient-to-br from-[#6B4423] to-[#8B6F47] hover:from-[#8B6F47] hover:to-[#6B4423] text-white rounded-sm text-sm"
                              >
                                save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditText('');
                                }}
                                className="px-3 py-1 border border-gray-300 hover:bg-gray-100 text-gray-900 rounded-sm text-sm"
                              >
                                cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-800">{comment.text}</p>
                        )}
                      </div>

                      {/* Reply Button */}
                      <button
                        onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                        className="mt-2 text-sm text-[#6B4423] hover:text-[#8B6F47] flex items-center gap-1"
                      >
                        <Reply className="w-3 h-3" />
                        reply
                      </button>

                      {/* Reply Input */}
                      {replyingToId === comment.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 flex gap-2"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4A7C59]/10 to-[#5D7349]/10 flex items-center justify-center flex-shrink-0 text-sm">
                            {currentUserAvatar}
                          </div>
                          <div className="flex-1">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="write a reply..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-[#4A7C59] resize-none"
                              rows={2}
                              autoFocus
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleAddReply(comment.id)}
                                disabled={!replyText.trim()}
                                className={`px-3 py-1 rounded-sm text-sm ${
                                  replyText.trim()
                                    ? 'bg-gradient-to-br from-[#4A7C59] to-[#5D7349] hover:from-[#5D7349] hover:to-[#4A7C59] text-white'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                reply
                              </button>
                              <button
                                onClick={() => {
                                  setReplyingToId(null);
                                  setReplyText('');
                                }}
                                className="px-3 py-1 border border-gray-300 hover:bg-gray-100 text-gray-900 rounded-sm text-sm"
                              >
                                cancel
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Replies */}
                      {comment.replies.length > 0 && (
                        <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-200">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4A7C59]/10 to-[#5D7349]/10 flex items-center justify-center flex-shrink-0 text-sm">
                                {reply.userAvatar}
                              </div>
                              <div className="flex-1">
                                <div className="bg-white border border-gray-200 rounded-sm p-3">
                                  <div className="flex items-start justify-between mb-1">
                                    <div>
                                      <div className="text-sm text-gray-900">{reply.userName}</div>
                                      <div className="text-xs text-gray-500">{formatTimestamp(reply.timestamp)}</div>
                                    </div>
                                    {reply.userId === currentUserId && (
                                      <button
                                        onClick={() => handleDeleteReply(comment.id, reply.id)}
                                        className="p-1 hover:bg-gray-100 rounded-sm transition-colors"
                                      >
                                        <Trash2 className="w-3 h-3 text-gray-500 hover:text-red-600" />
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-800">{reply.text}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* New Comment Input */}
          <div className="border-t border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6B4423]/10 to-[#8B6F47]/10 flex items-center justify-center flex-shrink-0">
                {currentUserAvatar}
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="share your experience..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-[#6B4423] resize-none"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleAddComment();
                    }
                  }}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">press cmd/ctrl + enter to post</span>
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className={`px-4 py-2 rounded-sm transition-all flex items-center gap-2 ${
                      newComment.trim()
                        ? 'bg-gradient-to-br from-[#6B4423] to-[#8B6F47] hover:from-[#8B6F47] hover:to-[#6B4423] text-white shadow-md hover:shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    post comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
