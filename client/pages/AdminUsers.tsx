import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { UserProfile } from "@shared/user";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Form states for editing
  const [editForm, setEditForm] = useState({
    nickname: "",
    email: "",
    rating: 0,
    kd: 0,
    level: 1,
    wins: 0,
    losses: 0,
    totalMatches: 0,
    status: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if user is logged in and is admin
        const userData = localStorage.getItem("user");
        if (!userData) {
          navigate("/auth");
          return;
        }

        const userObj = JSON.parse(userData);
        if (userObj.status !== "Администратор") {
          navigate("/");
          return;
        }

        setUser(userObj);

        // Load all users
        const usersResponse = await fetch("/api/admin/users", {
          headers: {
            Authorization: `Bearer ${userObj.id}`,
          },
        });

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData);
          setFilteredUsers(usersData);
        }
      } catch (err) {
        console.error("Error loading admin data:", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleEditUser = (userToEdit: UserProfile) => {
    setSelectedUser(userToEdit);
    setEditForm({
      nickname: userToEdit.nickname,
      email: userToEdit.email,
      rating: userToEdit.rating,
      kd: userToEdit.kd,
      level: userToEdit.level,
      wins: userToEdit.wins,
      losses: userToEdit.losses,
      totalMatches: userToEdit.totalMatches,
      status: userToEdit.status,
    });
    setEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser || !user) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
        setEditDialogOpen(false);
      }
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!user || !confirm("Вы уверены, что хотите удалить этого пользователя?"))
      return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.id}`,
        },
      });

      if (response.ok) {
        setUsers(users.filter((u) => u.id !== userId));
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handleToggleAdmin = async (userId: string, makeAdmin: boolean) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({ makeAdmin }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      }
    } catch (err) {
      console.error("Error toggling admin status:", err);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Администратор":
        return "destructive";
      case "Чемпион":
      case "Легенда":
        return "default";
      case "Ветеран":
      case "Эксперт":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="dark min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {/* Top Navigation */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-6">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground/60 hover:text-foreground hover:bg-muted/50"
                  onClick={() => navigate("/")}
                >
                  🏠 Главная
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground/60 hover:text-foreground hover:bg-muted/50"
                  onClick={() => navigate("/admin")}
                >
                  🛡️ Матчи
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground/80 hover:text-foreground hover:bg-muted/50"
                >
                  👥 Пользователи
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <Badge
                  variant="secondary"
                  className="bg-primary text-primary-foreground rounded-md px-2 py-1 cursor-pointer hover:bg-primary/90 transition-colors"
                  onClick={() => navigate("/profile")}
                >
                  {user.nickname.slice(0, 2).toUpperCase()}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-primary">
              👥 Управление пользователями
            </h1>
            <p className="text-muted-foreground">
              Просмотр, редактирование и управление пользователями
            </p>
          </div>

          {/* Search and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="md:col-span-2 p-4">
              <Label htmlFor="search">Поиск по ID, нику или email</Label>
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Введите ID, ник или email для поиска"
                className="mt-2"
              />
            </Card>

            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {users.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Всего пользователей
              </div>
            </Card>

            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {users.filter((u) => u.status === "Администратор").length}
              </div>
              <div className="text-sm text-muted-foreground">
                Администраторов
              </div>
            </Card>
          </div>

          {/* Users Table */}
          <Card className="p-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                База данных пользователей
              </h2>

              <div className="space-y-2">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((userItem) => (
                    <div
                      key={userItem.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                          {userItem.nickname.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-foreground">
                              {userItem.nickname}
                            </span>
                            <Badge
                              variant={getStatusBadgeVariant(userItem.status)}
                            >
                              {userItem.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {userItem.id} • {userItem.email}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Рейтинг: {userItem.rating} • K/D: {userItem.kd} •
                            Уровень: {userItem.level}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(userItem)}
                        >
                          Редактировать
                        </Button>

                        {userItem.status !== "Администратор" ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleToggleAdmin(userItem.id, true)}
                          >
                            Сдела��ь админом
                          </Button>
                        ) : (
                          userItem.id !== user?.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleToggleAdmin(userItem.id, false)
                              }
                            >
                              Убрать админа
                            </Button>
                          )
                        )}

                        {userItem.id !== user?.id && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(userItem.id)}
                          >
                            Удалить
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    {searchTerm
                      ? "Пользователи не найдены"
                      : "Нет пользов��телей в базе данных"}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Edit User Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Редактировать пользователя</DialogTitle>
              <DialogDescription>
                Изменение данных пользователя {selectedUser?.nickname}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profile">Профиль</TabsTrigger>
                  <TabsTrigger value="stats">Статистика</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nickname">Никнейм</Label>
                      <Input
                        id="nickname"
                        value={editForm.nickname}
                        onChange={(e) =>
                          setEditForm({ ...editForm, nickname: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rating">Рейтинг</Label>
                      <Input
                        id="rating"
                        type="number"
                        value={editForm.rating}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            rating: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="level">Уровень</Label>
                      <Input
                        id="level"
                        type="number"
                        value={editForm.level}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            level: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="status">Статус</Label>
                    <Select
                      value={editForm.status}
                      onValueChange={(value) =>
                        setEditForm({ ...editForm, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Новичок">Новичок</SelectItem>
                        <SelectItem value="Игрок">Игрок</SelectItem>
                        <SelectItem value="Опытный игрок">
                          Опытный игрок
                        </SelectItem>
                        <SelectItem value="Ветеран">Ветеран</SelectItem>
                        <SelectItem value="Эксперт">Эксперт</SelectItem>
                        <SelectItem value="Элитный игрок">
                          Элитный игрок
                        </SelectItem>
                        <SelectItem value="Легенда">Легенда</SelectItem>
                        <SelectItem value="Чемпион">Чемпион</SelectItem>
                        <SelectItem value="Администратор">
                          Администратор
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="stats" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="wins">Победы</Label>
                      <Input
                        id="wins"
                        type="number"
                        value={editForm.wins}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            wins: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="losses">Поражения</Label>
                      <Input
                        id="losses"
                        type="number"
                        value={editForm.losses}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            losses: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="totalMatches">Всего матчей</Label>
                      <Input
                        id="totalMatches"
                        type="number"
                        value={editForm.totalMatches}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            totalMatches: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="kd">K/D</Label>
                      <Input
                        id="kd"
                        type="number"
                        step="0.01"
                        value={editForm.kd}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            kd: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Отмена
              </Button>
              <Button onClick={handleSaveUser}>Сохранить изменения</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
