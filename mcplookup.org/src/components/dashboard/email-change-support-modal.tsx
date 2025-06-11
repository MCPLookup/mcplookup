"use client"

import { useState } from 'react'
import {
  Box,
  VStack,
  Text,
  Heading,
  Input,
  Textarea,
  Alert,
  AlertDescription,
  Button,
  HStack
} from '@/components/ui/chakra-compat-simple'
import { 
  DialogRoot,
  DialogContent, 
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogBackdrop,
  DialogCloseTrigger
} from '@chakra-ui/react'
import { Field } from '@/components/ui/field'
import { FaEnvelope, FaTimes, FaPaperPlane } from 'react-icons/fa'

interface EmailChangeSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  onSuccess: () => void;
}

export function EmailChangeSupportModal({ 
  isOpen, 
  onClose, 
  currentEmail, 
  onSuccess 
}: EmailChangeSupportModalProps) {
  const [requestedEmail, setRequestedEmail] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/support/email-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_email: currentEmail,
          requested_email: requestedEmail,
          reason
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          onSuccess()
          onClose()
          // Reset form
          setRequestedEmail('')
          setReason('')
          setSuccess(false)
        }, 2000)
      } else {
        setError(data.error || 'Failed to submit email change request')
      }
    } catch (error) {
      setError('Failed to submit request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      setError(null)
      setSuccess(false)
    }
  }

  return (    <DialogRoot open={isOpen} onOpenChange={(details: any) => details.open || handleClose()}>
      <DialogBackdrop />
      <DialogContent maxW="md">
        <DialogHeader>
          <HStack gap={2}>
            <FaEnvelope className="text-blue-500" />
            <DialogTitle>Request Email Change</DialogTitle>
          </HStack>
          <DialogCloseTrigger onClick={handleClose} disabled={isSubmitting}>
            <FaTimes />
          </DialogCloseTrigger>
        </DialogHeader>

        <DialogBody>
          {success ? (
            <Alert status="success">
              <Alert.Icon />
              <Alert.Description>
                Email change request submitted successfully! Our support team will review your request and contact you within 1-2 business days.
              </Alert.Description>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <VStack gap={4} align="stretch">
                <Alert status="info">
                  <Alert.Icon />
                  <Alert.Description>
                    For security reasons, email changes require manual verification by our support team. 
                    Please provide your new email address and reason for the change.
                  </Alert.Description>
                </Alert>

                {error && (
                  <Alert status="error">
                    <Alert.Icon />
                    <Alert.Description>{error}</Alert.Description>
                  </Alert>
                )}

                <Field label="Current Email">
                  <Input value={currentEmail} disabled />
                </Field>

                <Field label="New Email Address" required>
                  <Input
                    type="email"
                    placeholder="your.new.email@example.com"
                    value={requestedEmail}
                    onChange={(e) => setRequestedEmail(e.target.value)}
                    required
                  />
                </Field>

                <Field label="Reason for Change" required>
                  <Textarea
                    placeholder="Please explain why you need to change your email address..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    required
                  />
                  <Text fontSize="xs" color="gray.500">
                    Common reasons: Company email change, personal preference, security concerns, etc.
                  </Text>
                </Field>

                <Box>
                  <Text fontSize="sm" color="gray.600" mb={4}>
                    <strong>What happens next:</strong>
                    <br />
                    1. We'll verify your identity and review your request
                    <br />
                    2. You'll receive a verification email at your new address
                    <br />
                    3. Once verified, your email will be updated
                    <br />
                    4. You'll receive confirmation at both email addresses
                  </Text>
                </Box>

                <Button
                  type="submit"
                  colorPalette="blue"
                  loading={isSubmitting}
                  disabled={!requestedEmail || !reason}
                  leftIcon={<FaPaperPlane />}
                >
                  Submit Email Change Request
                </Button>
              </VStack>
            </form>
          )}        </DialogBody>
      </DialogContent>
    </DialogRoot>
  )
}
