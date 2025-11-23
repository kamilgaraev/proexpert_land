import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '@utils/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, UserPlus, Mail } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

const MembersList: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  // const [error] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await userService.getOrganizationUsers();
        
        if (!response || !response.data || !response.data.data) {
          setMembers([]);
          setFilteredMembers([]);
          setIsLoading(false);
          return;
        }
        
        const users = response.data.data;
        
        if (!Array.isArray(users) || users.length === 0) {
          setMembers([]);
          setFilteredMembers([]);
          setIsLoading(false);
          return;
        }
        
        const formattedMembers = users.map((user: any) => {
          let role = user.role || 'Пользователь';
          if (user.id === 1) role = 'Администратор';
          
          return {
            id: user.id,
            name: user.name || 'Без имени',
            email: user.email || '',
            role: role,
            status: 'Активен',
            created_at: new Date().toLocaleDateString('ru-RU')
          };
        });
        
        setMembers(formattedMembers);
        setFilteredMembers(formattedMembers);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = members.filter(member => 
        member.name.toLowerCase().includes(lowerQuery) || 
        member.email.toLowerCase().includes(lowerQuery) ||
        member.role.toLowerCase().includes(lowerQuery)
      );
      setFilteredMembers(filtered);
    } else {
      setFilteredMembers(members);
    }
  }, [searchQuery, members]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Команда</h1>
            <p className="text-muted-foreground">Управление сотрудниками и правами доступа</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" asChild>
                <Link to="/dashboard/contractor-invitations">
                    <Mail className="mr-2 h-4 w-4" />
                    Приглашения
                </Link>
            </Button>
            <Button asChild>
                <Link to="/dashboard/members/create">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Добавить участника
                </Link>
            </Button>
        </div>
      </div>

      <div className="flex items-center py-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по имени или email..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-9"
            />
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Сотрудник</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Дата добавления</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                      Загрузка...
                  </TableCell>
               </TableRow>
            ) : filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-medium">{member.name}</span>
                            <span className="text-xs text-muted-foreground">{member.email}</span>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                        {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'Активен' ? 'default' : 'secondary'} className="font-normal">
                        {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{member.created_at}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Меню</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Действия</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link to={`/dashboard/members/edit/${member.id}`}>Редактировать</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Изменить роль</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => {
                             if (window.confirm('Вы уверены?')) {
                                 // delete logic
                             }
                        }}>
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  {searchQuery ? 'Ничего не найдено' : 'Список пуст'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MembersList;
