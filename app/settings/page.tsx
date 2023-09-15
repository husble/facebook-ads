'use client';

import { Button } from 'antd';

import {
  Container,
  SkeletonBtn,
  SkeletonImg,
  SkeletonInner,
  SkeletonLineOne,
  SkeletonLineTwo
} from './style';

const Skeleton = () => (
  <SkeletonInner>
    <SkeletonImg />
    <SkeletonBtn />
    <SkeletonLineOne />
    <SkeletonLineTwo />
  </SkeletonInner>
);

export default function Page() {
  return (
    <div className="space-y-4">
      <Button type="primary" className="text-black">
        Button
      </Button>
      <h1 className="text-xl font-medium text-gray-400/80">
        Styled with Styled Components
      </h1>
      <Container>
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </Container>
    </div>
  );
}
