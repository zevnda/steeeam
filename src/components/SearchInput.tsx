'use client'

import { Button, Input } from '@heroui/react'
import { FaArrowRight } from 'react-icons/fa'
import { RiSearchLine } from 'react-icons/ri'

export default function SearchInput({
  inputValue,
  setInputValue,
  handleSubmit,
  handleEnterPress,
  placeholder = 'zevnda or 76561198158912649',
  isLoading,
}: {
  inputValue: string
  setInputValue: (value: string) => void
  handleSubmit: () => void
  handleEnterPress: (e: React.KeyboardEvent) => void
  placeholder?: string
  isLoading?: boolean
}) {
  return (
    <Input
      size='lg'
      value={inputValue}
      onValueChange={setInputValue}
      isDisabled={isLoading}
      startContent={<RiSearchLine className='text-neutral-500' fontSize={22} />}
      placeholder={placeholder}
      classNames={{
        inputWrapper: [
          'bg-base duration-150 transition-all',
          'hover:!bg-base-hover',
          'group-data-[focus=true]:!bg-base-hover',
          'group-data-[focus=true]:!shadow-custom',
          'border border-light-border',
          'group-data-[focus=true]:!border-hover-border',
          'hover:!border-hover-border rounded-lg',
        ],
      }}
      onKeyDown={handleEnterPress}
      endContent={
        <Button
          size='sm'
          isIconOnly
          isDisabled={!inputValue}
          startContent={<FaArrowRight />}
          onPress={handleSubmit}
          className='bg-pop text-black ml-5'
        />
      }
    />
  )
}
