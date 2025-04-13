'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Notebook as Robot } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push(redirectTo);
      }
    });

    return () => subscription.unsubscribe();
  }, [redirectTo, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="min-vh-100 d-flex align-items-center justify-content-center py-5">
      <Row className="justify-content-center w-100">
        <Col xs={12} md={8} lg={6} xl={5}>
          <div className="text-center mb-4">
            <Link href="/" className="text-decoration-none">
              <div className="d-flex align-items-center justify-content-center mb-3">
                <Robot className="text-primary" size={40} />
                <span className="fs-3 fw-bold ms-2">OpenHumanoid</span>
              </div>
            </Link>
            <h2 className="fw-bold">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
            <p className="text-muted">
              {isSignUp 
                ? 'Join our community of robotics enthusiasts'
                : 'Sign in to access your account'}
            </p>
          </div>

          <Card className="shadow-sm">
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="w-100 mb-3"
                  size="lg"
                >
                  {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
                </Button>

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-decoration-none"
                  >
                    {isSignUp
                      ? 'Already have an account? Sign in'
                      : "Don't have an account? Sign up"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}