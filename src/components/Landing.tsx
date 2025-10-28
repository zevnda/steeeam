'use client'

import { Select, SelectItem } from '@heroui/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import SearchInput from '@/components/SearchInput'

export default function Landing() {
  const [inputValue, setInputValue] = useState('')
  const [currency, setCurrency] = useState('')
  const router = useRouter()

  const countryCodes = [
    { label: 'Australian Dollar', value: 'au' },
    { label: 'British Pound', value: 'uk' },
    { label: 'Canadian Dollar', value: 'ca' },
    { label: 'Euro', value: 'eu' },
    { label: 'New Zealand Dollar', value: 'nz' },
    { label: 'US Dollar', value: 'us' },
  ]

  const handleEnterPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    if (!inputValue) return
    router.push(`/${inputValue}${currency ? `?c=${currency}` : ''}`)
  }

  return (
    <div
      className='absolute flex justify-center items-center top-0 left-0 w-screen px-8 h-screen bg-black'
      style={{ backgroundImage: 'url(/landing-bg.svg)' }}
    >
      <div className='flex flex-col justify-center items-center space-y-4 md:w-[50%]'>
        <SearchInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSubmit={handleSubmit}
          handleEnterPress={handleEnterPress}
        />

        {/* Currency select */}
        <Select
          size='sm'
          radius='sm'
          aria-label='currency'
          label='Currency'
          onSelectionChange={keys => setCurrency(Array.from(keys)[0] as string)}
          className='w-full lg:w-[300px]'
          classNames={{
            trigger: [
              '!bg-base',
              'hover:!bg-base-hover',
              'group-data-[open=true]:!shadow-custom',
              'border',
              'border-light-border',
              'hover:!border-hover-border',
            ],
            value: ['!text-white'],
            label: ['!text-neutral-400'],
          }}
          popoverProps={{
            classNames: {
              content: ['!bg-base', '!border', '!border-light-border', 'group-data-[focus=true]:!shadow-custom'],
            },
          }}
        >
          {countryCodes.map(code => (
            <SelectItem aria-label={code.value} key={code.value}>
              {code.label}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
  )
}
